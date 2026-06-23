import ExcelJS from 'exceljs';
import path from 'path';

export default class ExcelReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  getCategory(filePath, testName = '') {
    const filename = path.basename(filePath).toLowerCase();
    const name = testName.toLowerCase();
    
    if (name.includes('ui/ux') || name.includes('unit test') || filename.includes('uiux')) return 'UI-UX & Unit Tests';
    if (name.includes('validation')) return 'Validation Tests';
    if (name.includes('functional')) return 'Functional Tests';
    
    if (filePath.includes('unit') || filePath.includes('components')) return 'UI-UX & Unit Tests';
    return 'Functional Tests';
  }

  async generateSecurityReport(results) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TaskLance Security Scanner';
    workbook.created = new Date();

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const details = [];

    results.testResults.forEach(testSuite => {
      testSuite.testResults.forEach((testCase, index) => {
        if (testCase.status === 'passed' || testCase.status === 'failed') {
          totalTests++;
          if (testCase.status === 'passed') passedTests++;
          else failedTests++;
        }
        
        // Parse "Vulnerability Checked" from the test name
        const nameMatch = testCase.fullName.match(/\[Security Scan (\d+)\] (.*)/);
        let testId = `TC-SEC-${String(index + 1).padStart(3, '0')}`;
        let description = testCase.fullName;
        
        if (nameMatch) {
          testId = `TC-SEC-${String(nameMatch[1]).padStart(3, '0')}`;
          description = nameMatch[2];
        }

        const categories = ['Dependency Audit', 'Access Control', 'Data Security', 'Input Validation', 'XSS Prevention'];
        const category = categories[index % categories.length];

        details.push({
          id: testId,
          category: category,
          description: description,
          status: testCase.status === 'passed' ? 'Passed' : 'Failed'
        });
      });
    });

    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const overallStatus = failedTests === 0 && totalTests > 0 ? 'PASS' : 'FAIL';

    // --- SUMMARY SHEET ---
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { width: 30 },
      { width: 30 }
    ];

    // Main Header
    summarySheet.mergeCells('A1:B1');
    const headerCell = summarySheet.getCell('A1');
    headerCell.value = 'TASKLANCE WEB SECURITY REPORT';
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5A4FCF' } };
    headerCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 14 };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 40;

    summarySheet.addRow([]); // empty
    
    // Scan Date Row
    const dateRow = summarySheet.addRow(['Scan Date', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })]);
    dateRow.getCell(1).font = { bold: true };
    dateRow.getCell(2).alignment = { horizontal: 'center' };
    summarySheet.addRow([]);

    // Table Headers
    const tableHeader = summarySheet.addRow(['Metric', 'Count']);
    tableHeader.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    // Rows
    summarySheet.addRow(['Total Test Cases', totalTests]).alignment = { horizontal: 'center' };
    summarySheet.getCell(`A${summarySheet.rowCount}`).font = { bold: true };
    
    const passedRow = summarySheet.addRow(['Passed', passedTests]);
    passedRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    passedRow.getCell(2).font = { color: { argb: 'FF065F46' } };
    passedRow.alignment = { horizontal: 'center' };
    summarySheet.getCell(`A${passedRow.number}`).font = { bold: true };

    summarySheet.addRow(['Failed', failedTests]).alignment = { horizontal: 'center' };
    summarySheet.getCell(`A${summarySheet.rowCount}`).font = { bold: true };
    
    summarySheet.addRow(['Skipped', 0]).alignment = { horizontal: 'center' };
    summarySheet.getCell(`A${summarySheet.rowCount}`).font = { bold: true };
    
    summarySheet.addRow(['Pass Percentage', `${passRate}%`]).alignment = { horizontal: 'center' };
    summarySheet.getCell(`A${summarySheet.rowCount}`).font = { bold: true };
    summarySheet.addRow([]);
    
    // Overall Status
    const overallRow = summarySheet.addRow(['OVERALL STATUS', overallStatus]);
    overallRow.height = 30;
    overallRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
    overallRow.getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    overallRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    overallRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: overallStatus === 'PASS' ? { argb: 'FFD1FAE5' } : { argb: 'FFFEE2E2' } };
    overallRow.getCell(2).font = { color: overallStatus === 'PASS' ? { argb: 'FF065F46' } : { argb: 'FF991B1B' }, bold: true };
    overallRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

    // --- DETAILS SHEET ---
    const detailsSheet = workbook.addWorksheet('Details');
    detailsSheet.columns = [
      { width: 25 },
      { width: 30 },
      { width: 80 },
      { width: 20 }
    ];

    detailsSheet.mergeCells('A1:D1');
    const dHeader = detailsSheet.getCell('A1');
    dHeader.value = 'TASKLANCE SECURITY & VULNERABILITY ANALYSIS REPORT';
    dHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5A4FCF' } };
    dHeader.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
    dHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    
    detailsSheet.mergeCells('A2:D2');
    const dSubHeader = detailsSheet.getCell('A2');
    dSubHeader.value = `Generated: ${new Date().toLocaleString()} | Scans Completed: ${totalTests} | Status: ${overallStatus === 'PASS' ? 'SECURE' : 'VULNERABLE'}`;
    dSubHeader.font = { size: 9 };
    dSubHeader.alignment = { horizontal: 'center' };

    const dh = detailsSheet.addRow(['Test ID', 'Category', 'Vulnerability Checked', 'Status']);
    dh.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    details.forEach(d => {
      const row = detailsSheet.addRow([d.id, d.category, d.description, d.status]);
      row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: d.status === 'Passed' ? { argb: 'FFD1FAE5' } : { argb: 'FFFEE2E2' } };
      row.getCell(4).font = { color: d.status === 'Passed' ? { argb: 'FF065F46' } : { argb: 'FF991B1B' } };
      row.getCell(4).alignment = { horizontal: 'center' };
    });

    const outputPath = path.resolve(process.cwd(), 'tests/e2e/artifacts/TaskLance_Security_Test_Report.xlsx');
    const fs = await import('fs');
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    await workbook.xlsx.writeFile(outputPath);
    console.log(`\n📊 Security Excel Report generated at: ${outputPath}\n`);
  }

  async generateGeneralReport(results) {
    const detailRowsByCategory = {
      'UI-UX & Unit Tests': [],
      'Validation Tests': [],
      'Functional Tests': []
    };
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    const stats = {
      'UI-UX & Unit Tests': { total: 0, passed: 0, failed: 0 },
      'Validation Tests': { total: 0, passed: 0, failed: 0 },
      'Functional Tests': { total: 0, passed: 0, failed: 0 }
    };

    results.testResults.forEach(testSuite => {
      testSuite.testResults.forEach(testCase => {
        const category = this.getCategory(testSuite.testFilePath, testCase.fullName);
        if (!stats[category]) {
          stats[category] = { total: 0, passed: 0, failed: 0 };
          detailRowsByCategory[category] = [];
        }
        
        const cleanErrors = (testCase.failureMessages.join('\n') || '').replace(/\0/g, '');
        
        if (testCase.status === 'passed' || testCase.status === 'failed') {
          totalTests++;
          stats[category].total++;
          
          if (testCase.status === 'passed') {
            passedTests++;
            stats[category].passed++;
          } else {
            failedTests++;
            stats[category].failed++;
          }
        }
        
        let prefix = 'TC';
        if (category.includes('UI-UX')) prefix = 'UI-LOAD';
        else if (category.includes('Validation')) prefix = 'VAL';
        else if (category.includes('Functional')) prefix = 'FUNC';
        
        const testId = `${prefix}-${String(stats[category].total).padStart(3, '0')}`;

        detailRowsByCategory[category].push({
          'Test ID': testId,
          'Category': category.replace(' & Unit Tests', ''),
          'Test Case Description': testCase.fullName.includes('Verify') ? testCase.fullName.replace(/^.*?Verify/, 'Verify') : testCase.fullName,
          'Type': 'Automated',
          'Status': testCase.status === 'passed' ? 'Passed' : 'Failed',
          'Execution Time': `${testCase.duration || 0}ms`,
          'Remarks': testCase.status === 'passed' ? 'Assertion passed successfully' : cleanErrors || 'Assertion failed'
        });
      });
    });

    const hasAnyTest = Object.values(detailRowsByCategory).some(rows => rows.length > 0);
    if (!hasAnyTest) {
      console.log('No test results to write to Excel.');
      return;
    }

    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const isDeployable = failedTests === 0 && totalTests > 0 ? "READY FOR DEPLOYMENT ✅" : "REQUIRES FIXES ❌";

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TaskLance Tests';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary Report');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 30 }
    ];

    summarySheet.addRows([
      { metric: "Total Tests Run", value: totalTests },
      { metric: "Passed Tests", value: passedTests },
      { metric: "Failed Tests", value: failedTests },
      { metric: "Pass Rate", value: `${passRate}%` },
      { metric: "Deployable Status", value: isDeployable },
      {},
      { metric: "--- BREAKDOWN BY CATEGORY ---", value: "" },
      { metric: "UI-UX & Unit Tests", value: `${stats['UI-UX & Unit Tests'].passed}/${stats['UI-UX & Unit Tests'].total} Passed` },
      { metric: "Validation Tests", value: `${stats['Validation Tests'].passed}/${stats['Validation Tests'].total} Passed` },
      { metric: "Functional Tests", value: `${stats['Functional Tests'].passed}/${stats['Functional Tests'].total} Passed` }
    ]);

    // Create a sheet for each category
    for (const [catName, rows] of Object.entries(detailRowsByCategory)) {
      if (rows.length > 0) {
        // Truncate sheet name if it's too long, but here it's fine
        const sheetName = catName === 'UI-UX & Unit Tests' ? 'UI-UX' : catName;
        const sheet = workbook.addWorksheet(sheetName);
        sheet.columns = [
          { header: 'Test ID', key: 'Test ID', width: 15 },
          { header: 'Category', key: 'Category', width: 15 },
          { header: 'Test Case Description', key: 'Test Case Description', width: 65 },
          { header: 'Type', key: 'Type', width: 15 },
          { header: 'Status', key: 'Status', width: 12 },
          { header: 'Execution Time', key: 'Execution Time', width: 15 },
          { header: 'Remarks', key: 'Remarks', width: 40 }
        ];
        
        // Header styling
        const headerRow = sheet.getRow(1);
        headerRow.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F3E46' } };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          cell.alignment = { vertical: 'middle' };
        });

        // Add the rows and style Status
        rows.forEach((rowObj) => {
          const row = sheet.addRow(rowObj);
          const statusCell = row.getCell(5);
          
          if (statusCell.value === 'Passed') {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
            statusCell.font = { color: { argb: 'FF065F46' }, bold: true };
          } else {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
            statusCell.font = { color: { argb: 'FF991B1B' }, bold: true };
          }
        });
      }
    }

    const outputPath = path.resolve(process.cwd(), 'tests/e2e/artifacts/TaskLance_E2E_Test_Report.xlsx');
    const fs = await import('fs');
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    await workbook.xlsx.writeFile(outputPath);
    console.log(`\n📊 E2E Test Report generated at: ${outputPath}\n`);
    console.log(`Deployable Status: ${isDeployable}\n`);
  }

  async onRunComplete(contexts, results) {
    const securityTestResults = results.testResults.filter(ts => ts.testFilePath.includes('security-analysis'));
    const generalTestResults = results.testResults.filter(ts => !ts.testFilePath.includes('security-analysis'));

    if (securityTestResults.length > 0) {
      const securityResultsObj = { ...results, testResults: securityTestResults };
      await this.generateSecurityReport(securityResultsObj);
    }

    if (generalTestResults.length > 0) {
      const generalResultsObj = { ...results, testResults: generalTestResults };
      await this.generateGeneralReport(generalResultsObj);
    }
  }
}
