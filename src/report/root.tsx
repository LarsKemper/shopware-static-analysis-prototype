export interface RootProps {
  children: React.ReactNode;
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    fontFamily: "Arial, sans-serif",
    margin: 20,
    backgroundColor: "#121212",
    color: "#e0e0e0",
  }
}

export default function Root({ children }: RootProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SWAG Architecture Report</title>
      </head>
      <body style={styles.body}>
        {children}
      </body>
    </html>
  );
}
