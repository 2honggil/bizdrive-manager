export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/2 -ml-[40rem] w-[80rem] h-[40rem] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/2 -mr-[40rem] w-[80rem] h-[40rem] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            {children}
        </div>
    );
}
