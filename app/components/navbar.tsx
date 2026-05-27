import Logo from "./logo";
import Link from "next/link";
import { FaFolderPlus, FaArrowLeft } from "react-icons/fa";
import { IoIosStats } from "react-icons/io";


export default function Navbar() {
    return (
        <nav style={{marginBottom: '30px'}}>
            <div className=" flex items-center mx-auto w-4/5 justify-between my-5" >
                <div className={"flex items-center gap-5"}>
                    <Link href={"/dashboard"} title="Aller à la page d'accueil" className={""}>
                        <Logo size={48} />
                    </Link>
                </div>
                <div className={"flex gap-5"}>
                    <Link href={"/newsletter/create"} title="Créer une campagne" className={"bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors flex items-center"}>
                        <FaFolderPlus size={20} />
                        <span className={"ml-3"}>Créer une campagne</span>
                    </Link>
                    <Link href={"/statistics"} title="Voir les statistiques" className={"bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors flex items-center"}>
                        <IoIosStats size={20} />
                        <span className={"ml-3"}>Statistiques</span>
                    </Link>
                </div>
            </div>
            <Link href={"/dashboard"} className={"w-4/5 mx-auto flex items-center gap-2 text-gray-600 hover:text-black transition-colors"}>
                <FaArrowLeft size={20} />
                Retour au tableau de bord
            </Link>
        </nav>
    );
}