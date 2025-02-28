import { ClassDefinition } from "../index.d.ts";

export function getReport(
  classUsages: Map<string, string[]>,
  classDefinitions: Map<string, ClassDefinition>,
) {
  const sortedByUsageCount = [...classUsages.entries()].sort((a, b) =>
    b[1].length - a[1].length
  );

  return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SW Architecture Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #121212; 
            color: #e0e0e0; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            background-color: #1e1e1e; 
        }
        th, td { 
            border: 1px solid #333; 
            padding: 8px; 
            text-align: left; 
            vertical-align: top;
        }
        th { 
            background-color: #333; 
            color: #ffffff; 
        }
        .collapsible { 
            cursor: pointer; 
            background-color: #2c2c2c; 
            border: none; 
            padding: 8px; 
            width: 100%; 
            text-align: left; 
            color: #ffffff; 
        }
        .content { 
            display: none; 
            padding: 8px; 
            border-top: 1px solid #444; 
            background-color: #252525; 
        }
    </style>
    <script>
        function toggleCollapse(id) {
            const content = document.getElementById(id);
            if (content.style.display === "none" || content.style.display === "") {
                content.style.display = "block";
            } else {
                content.style.display = "none";
            }
        }
    </script>
</head>
<body>
    <h1>Shopware Architecture Report</h1>
    <table>
        <thead>
            <tr>
                <th>Uses Found</th>
                <th>Classname</th>
                <th>Domain</th>
                <th>Is Internal</th>
            </tr>
        </thead>
        <tbody>
            ${
    sortedByUsageCount.map(([classname, usages], index) => {
      const classInfo = classDefinitions.get(classname);

      if (!classInfo) {
        return "";
      }

      return `
                <tr>
                    <td>${usages.length}</td>
                    <td>
                        <button class="collapsible" onclick="toggleCollapse('content-${index}')">${classname}</button>
                        <div id="content-${index}" class="content">
                            <ul>
                                ${
        usages.map((file) => `<li>${file}</li>`).join("")
      }
                            </ul>
                        </div>
                    </td>
                    <td>${classInfo.domain || "N/A"}</td>
                    <td>${classInfo.isInternal ? "Yes" : "No"}</td>
                </tr>`;
    }).join("")
  }
        </tbody>
    </table>
</body>
</html>`;
}
