import { HomeExperience } from "@/components/home-experience";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-primary-background text-primary-font">
      <SiteHeader />
      <HomeExperience />
    </div>
  );
}
