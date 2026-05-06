import Logo from "./logo";
import Link from "next/link";
import { FaFolderPlus } from "react-icons/fa";

export default function Navbar() {
    return (
        <nav className=" flex items-center mx-auto w-4/5 justify-between my-5" >
            <div className={"flex items-center gap-5"}>
                <Link href={"/dashboard"} className={"flex items-center gap-2"}>
                    <Logo size={48} />
                    <span className={"font-bold text-xl ml-5"}>Agora</span>
                </Link>
            </div>
            <div className={"flex items-center gap-5"}>
                <Link href={"/newsletter/create"} className={"bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors flex items-center"}>
                    <FaFolderPlus size={20} />
                    <span className={"ml-3"}>Campagne</span>
                </Link>
            </div>
        </nav>
    );
}