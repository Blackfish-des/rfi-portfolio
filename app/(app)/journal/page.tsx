import Link from "next/link";
import { Plus } from "lucide-react";

export default function JournalPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#000054]">Field Journal</h1>
          <p className="text-gray-500 text-sm mt-1">Your running record across all courses</p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 bg-[#E3001B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Plus size={14} />
          New entry
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-sm">Journal entries will appear here.</p>
        <p className="text-gray-400 text-xs mt-1">Coming in the next build.</p>
      </div>
    </div>
  );
}
