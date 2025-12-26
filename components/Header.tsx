import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* LEFT — BRAND */}
        <div className="flex items-center gap-4">
          {/* LOGO */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white text-sm font-bold">
            UTM
          </div>

          {/* TITLE */}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">
              Sistem Akademik
            </span>
            <span className="text-xs text-muted-foreground">
              Universitas Widyatama
            </span>
          </div>
        </div>

        {/* RIGHT — AUTH */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">
                Masuk
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition">
                Daftar
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center justify-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-9 w-9 rounded-full border border-border shadow-sm",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
