import { Link, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  LogOut,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useDemoToolsSetting } from '@/hooks/use-demo-tools-setting';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initials } from '@/lib/format';
import { OPEN_DEMO_TOOLS_EVENT } from '@/components/demo/demo-tools-dock';

export function ProfileMenu() {
  const { profile, user, signOut, isDemo } = useAuth();
  const demoTools = useDemoToolsSetting();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out — see you at the mess');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign out');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open profile menu"
        >
          <Avatar className="h-9 w-9 border-2 border-white shadow-soft">
            <AvatarFallback className="bg-primary-soft text-[11px] text-primary-deep">
              {initials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <Settings2 className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block truncate text-[13px] font-bold text-foreground">
            {profile?.full_name ?? 'Hosteller'}
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-normal text-muted-foreground">
            {user?.email}
          </span>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-deep">
            <Sparkles className="h-2.5 w-2.5" />
            {profile?.hostel ?? 'BIT Patna'}
            {profile?.wing ? ` · ${profile.wing}` : ''}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings2 />
            Settings
          </Link>
        </DropdownMenuItem>
        {isDemo && demoTools.enabled ? (
          <DropdownMenuItem
            onSelect={() => {
              window.dispatchEvent(new CustomEvent(OPEN_DEMO_TOOLS_EVENT));
            }}
            className="cursor-pointer"
          >
            <FlaskConical />
            Demo tools
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void handleSignOut();
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
