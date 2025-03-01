import { ClassDefinition } from "../index.d.ts";
import Root from "./root.tsx";
import { renderToString } from "react-dom/server";
import { calculateStabilityRatio, sort } from "../lib/utils.ts";

export interface ReportProps {
  classUsages: Map<string, string[]>;
  classDefinitions: Map<string, ClassDefinition>;
  domains?: string[];
  sortKey?: string;
}

interface ReportItemProps {
  classInfo: ClassDefinition;
  usages: string[];
}

export function renderReportToString({ ...props }: ReportProps): string {
  return renderToString(<Report {...props} />);
}

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 20,
    backgroundColor: "#1e1e1e",
  },
  th: {
    border: "1px solid #333",
    padding: 8,
    textAlign: "left",
    verticalAlign: "top",
    backgroundColor: "#333",
    color: "#ffffff",
  },
  td: {
    border: "1px solid #333",
    padding: 8,
    textAlign: "left",
    verticalAlign: "top",
  },
  collapsible: {
    cursor: "pointer",
    backgroundColor: "#2c2c2c",
    border: "none",
    padding: 8,
    textAlign: "left",
    color: "#ffffff",
  },
  content: {
    padding: 8,
    borderTop: "1px solid #444",
    backgroundColor: "#252525",
  },
};

export default function Report(
  { classUsages, classDefinitions, domains, sortKey }: ReportProps,
) {
  let entries = sort(
    classUsages,
    classDefinitions,
    sortKey || "usage",
  );

  if (domains) {
    entries = entries.filter(([_, classInfo]) =>
      !(domains && classInfo && !domains.includes(classInfo.domain || ""))
    );
  }

  return (
    <Root>
      <h1>Shopware Architecture Report</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Uses Found</th>
            <th style={styles.th}>Dependencies</th>
            <th style={styles.th}>Classname</th>
            <th style={styles.th}>Domain</th>
            <th style={styles.th}>Stability</th>
            <th style={styles.th}>Is Internal</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([className, classInfo]) => {
            const usages = classUsages.get(className);

            if (!usages) {
              return null;
            }

            return (
              <ReportItem
                key={className}
                classInfo={classInfo}
                usages={usages}
              />
            );
          })}
        </tbody>
      </table>
    </Root>
  );
}

function ReportItem({ classInfo, usages }: ReportItemProps) {
  return (
    <tr>
      <td style={styles.td}>{usages.length}</td>
      <td style={styles.td}>{classInfo.imports.length}</td>
      <td style={styles.td}>
        <details>
          <summary style={styles.collapsible}>{classInfo.className}</summary>
          <div style={styles.content}>
            <ul>
              {usages.map((file) => <li key={file}>{file}</li>)}
            </ul>
          </div>
        </details>
      </td>
      <td style={styles.td}>{classInfo.domain || "N/A"}</td>
      <td style={styles.td}>
        {calculateStabilityRatio(classInfo.imports.length, usages.length)
          .toFixed(2)}
      </td>
      <td style={styles.td}>{classInfo.isInternal ? "Yes" : "No"}</td>
    </tr>
  );
}
