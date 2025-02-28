import { ClassDefinition } from "../index.d.ts";
import Root from "./root.tsx";
import { renderToString } from "npm:react-dom/server";

export interface ReportProps {
  classUsages: Map<string, string[]>;
  classDefinitions: Map<string, ClassDefinition>;
}

interface ReportItemProps {
  classInfo: ClassDefinition;
  usages: string[];
}

export function renderRenderToString({ ...props }: ReportProps): string {
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
    width: "100%",
    textAlign: "left",
    color: "#ffffff",
  },
  content: {
    display: "none",
    padding: 8,
    borderTop: "1px solid #444",
    backgroundColor: "#252525",
  }
}

export default function Report({ classUsages, classDefinitions }: ReportProps) {
  const sortedByUsageCount = [...classUsages.entries()].sort((a, b) =>
    b[1].length - a[1].length
  );

  return (
    <Root>
      <h1>Shopware Architecture Report</h1>
      <table style={styles.table}>
        <thead>
        <tr>
          <th style={styles.th}>Uses Found</th>
          <th style={styles.th}>Classname</th>
          <th style={styles.th}>Domain</th>
          <th style={styles.th}>Is Internal</th>
        </tr>
        </thead>
        <tbody>
          {sortedByUsageCount.map(([className, usages]) => {
            const classInfo = classDefinitions.get(className);

            if (!classInfo) {
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
      <td>{usages.length}</td>
      <td>
        <button type="button" style={styles.collapsible}>{classInfo.className}</button>
        <div style={styles.content}>
          <ul>
            {usages.map((file) => `<li>${file}</li>`).join("")}
          </ul>
        </div>
      </td>
      <td>{classInfo.domain || "N/A"}</td>
      <td>{classInfo.isInternal ? "Yes" : "No"}</td>
    </tr>
  );
}