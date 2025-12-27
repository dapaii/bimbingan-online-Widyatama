const DashboardShell = ({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen p-6">
      <header className="mb-4 font-semibold">
        Dashboard {role}
      </header>
      <main>{children}</main>
    </div>
  );
};

export default DashboardShell;
