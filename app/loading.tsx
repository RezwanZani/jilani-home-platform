import HouseLoader from "@/components/ui/HouseLoader";

export default function GlobalLoading() {
    // Renders full screen while routing changes occur
    return <HouseLoader isOverlay={true} />;
}