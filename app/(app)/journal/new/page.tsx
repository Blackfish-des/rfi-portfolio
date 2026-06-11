import EntryEditor from "@/components/journal/EntryEditor";
import { getMethods } from "@/app/actions/methods";

export default async function NewEntryPage() {
  const methodLibrary = await getMethods();
  return <EntryEditor mode="new" methodLibrary={methodLibrary} />;
}
