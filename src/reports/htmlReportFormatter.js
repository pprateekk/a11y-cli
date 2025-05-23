function generateHTMLReport(results, url, severity, comparisonResult = null) {
  const violations = results.violations;
  const totalViolations = violations.length;

  let htmlString = `
		  <!DOCTYPE html>
		  <html>
			<head>
			  <meta charset="utf-8">
			  <title>Accessibility Audit Report</title>
			  <style>
				body {
				  font-family: Arial, sans-serif;
				  line-height: 1.5;
				  max-width: 1000px;
				  margin: 0 auto;
				  padding: 20px;
				  background-color: #f7f7f7;
				  color: #333;
				}
				
				h1 {
				  background-color: #3f51b5;
				  color: white;
				  padding: 15px;
				  border-radius: 5px;
				  text-align: center;
				}
				
				.summary, .comparison-summary {
				  background-color: white;
				  padding: 15px;
				  border-radius: 5px;
				  margin-bottom: 20px;
				  border: 1px solid #ddd;
				}
				
				.violation {
				  background-color: white;
				  padding: 15px;
				  margin-bottom: 15px;
				  border-radius: 5px;
				  border: 1px solid #ddd;
				}
				
				.violation-header {
				  border-bottom: 1px solid #eee;
				  padding-bottom: 10px;
				  margin-bottom: 10px;
				}
				
				.violation-id {
				  font-weight: bold;
				  color: #4b6cb7;
				}
				
				.impact {
				  display: inline-block;
				  padding: 3px 8px;
				  border-radius: 3px;
				  font-size: 14px;
				  margin-left: 10px;
				}
				
				.impact-critical {
				  background-color: #ff5252;
				  color: white;
				}
				
				.impact-serious {
				  background-color: #ff9800;
				  color: white;
				}
				
				.impact-moderate {
				  background-color: #ffeb3b;
				  color: #333;
				}
				
				.impact-minor {
				  background-color: #8bc34a;
				  color: white;
				}
				
				.element {
				  background-color: #f5f5f5;
				  padding: 10px;
				  margin-top: 10px;
				  border-radius: 3px;
				}
				
				code {
				  background-color: #eee;
				  padding: 2px 5px;
				  border-radius: 3px;
				  font-family: monospace;
				  display: block;
				  overflow-x: auto;
				  margin: 5px 0;
				}
				
				a {
				  color: #4b6cb7;
				}
				
				.help {
				  margin: 10px 0;
				}
				
				.fixed, .new {
				  display: inline-block;
				  padding: 3px 8px;
				  border-radius: 3px;
				  font-size: 14px;
				  font-weight: bold;
				  margin-right: 8px;
				}
				
				.fixed {
				  background-color: #4caf50;
				  color: white;
				}
				
				.new {
				  background-color: #2196f3;
				  color: white;
				}
				
				.comparison-details {
				  margin-top: 15px;
				}
			  </style>
			</head>
			<body>
			  <h1>Accessibility Audit Report</h1>
			  
			  <div class="summary">
				<p style="font-weight: bold">
					Found ${totalViolations} accessibility ${
    totalViolations === 1 ? "violation" : "violations"
  } 
					for 
					<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
				  </p>
				  <p>Filtered by severity: <strong>${severity}</strong></p>
				<p>Report generated: ${new Date().toLocaleString()}</p>
			  </div>
	  `;

  if (comparisonResult) {
    htmlString += `
			  <div class="comparison-summary">
				  <h2>Delta Report</h2>
				  <p><span class="fixed">Fixed</span> ${
            comparisonResult.fixedIssues.length
          } issues resolved since previous scan</p>
		  <p><span class="new">New</span> ${
        comparisonResult.newIssues.length
      } issues identified in current scan</p>
		  
		  <div class="comparison-details">
			${
        comparisonResult.fixedIssues.length > 0
          ? `<h3>Fixed Issues:</h3>
				<ul>
				  ${comparisonResult.fixedIssues
            .map(
              (issue) =>
                `<li><strong>${issue.id}</strong> - ${
                  issue.description || "No description"
                }</li>`
            )
            .join("")}
				</ul>`
          : ""
      }
			
			${
        comparisonResult.newIssues.length > 0
          ? `<h3>New Issues:</h3>
				<ul>
				  ${comparisonResult.newIssues
            .map(
              (issue) =>
                `<li><strong>${issue.id}</strong> - ${
                  issue.description || "No description"
                }</li>`
            )
            .join("")}
				</ul>`
          : ""
      }
		  </div>
		</div>
		  `;
  }

  // for each violation
  violations.forEach((violation) => {
    let impactClass = "impact-minor";
    if (violation.impact) {
      if (violation.impact.toLowerCase() === "critical") {
        impactClass = "impact-critical";
      } else if (violation.impact.toLowerCase() === "serious") {
        impactClass = "impact-serious";
      } else if (violation.impact.toLowerCase() === "moderate") {
        impactClass = "impact-moderate";
      }
    }

    // violation
    htmlString += `
			  <div class="violation">
				<div class="violation-header">
				  <span class="violation-id">${violation.id}</span>
				  <span class="impact ${impactClass}">${violation.impact || "Unknown"}</span>
				</div>
				
				<p>${violation.description}</p>
				
				<div class="help">
				  <strong>How to fix:</strong> 
				  <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a>
				</div>
				
				<h3>Affected Elements (${violation.nodes.length}):</h3>
	  `;

    // each affected element
    violation.nodes.forEach((node) => {
      htmlString += `
				<div class="element">
				  <code>${node.html}</code>
				  <p><em>${node.failureSummary || "No summary available"}</em></p>
				</div>
	  `;
    });

    htmlString += `
			  </div>
	  `;
  });

  htmlString += `
			</body>
		  </html>
	  `;

  return htmlString;
}

module.exports = generateHTMLReport;
