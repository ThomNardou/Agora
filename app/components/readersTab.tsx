import { Table, Input } from "@mui/joy";
import HomeResponseData from "../api/home/route";
import { RxCross1 } from "react-icons/rx";
import { IoCheckmarkOutline } from "react-icons/io5";
import { MdSearch } from "react-icons/md";



export default function ReadersTab({ readers }: { readers: HomeResponseData["readers"] }) {
    return (
        <>
            <div className="w-full flex-col flex items-end">
                <Input 
                    placeholder="Rechercher un lecteur..."
                    startDecorator={<MdSearch />}
                    sx={{ width: "300px", marginBottom: "20px" }} 
                    onInput={(e) => {
                        const value = (e.target as HTMLInputElement).value.toLowerCase();
                        const rows = document.querySelectorAll("tbody tr");
                        rows.forEach(row => {
                            const name = row.children[1].textContent?.toLowerCase() || "";
                            if (name.includes(value)) {
                                (row as HTMLElement).style.display = "";
                            } else {
                                (row as HTMLElement).style.display = "none";
                            }
                        });
                    }}
                />
                <Table sx={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Email</th>
                            <th>Reçoit les annonces</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {readers.map((reader) => (
                            <tr key={reader.id}>
                                <td>{reader.id}</td>
                                <td>{reader.email}</td>
                                <td>{reader.consentGiven ? (
                                    <div className="w-5 flex justify-center items-center aspect-square rounded-full  mr-2 bg-green-500">
                                        <IoCheckmarkOutline size={16} color="white" />
                                    </div>
                                ) : (
                                    <div className="w-5 flex justify-center items-center aspect-square rounded-full mr-2 bg-red-500">
                                        <RxCross1 size={12} color="white" />
                                    </div>
                                )}</td>
                                <td>
                                    <p>TODO</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </>
    )
}
