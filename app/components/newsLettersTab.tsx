import { Table, Input } from "@mui/joy";
import HomeResponseData from "../api/home/route";
import { MdSearch } from "react-icons/md";


export default function NewsLettersTab({ newsletters }: { newsletters: HomeResponseData["newsletters"] }) {
    return (
        <>
            <div className="w-full flex-col flex items-end">
                <Input 
                    placeholder="Rechercher une newsletter..."
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
                            <th>Nom</th>
                            <th>Date d'envoi</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newsletters.map((newsletter) => (
                            <tr key={newsletter.id}>
                                <td>{newsletter.id}</td>
                                <td>{newsletter.name}</td>
                                <td>{new Date(newsletter.sendAt).toLocaleDateString()} {new Date(newsletter.sendAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td>
                                    <span
                                        className="px-2 py-1 rounded-full text-sm font-medium content-center"
                                        style={{
                                            color: newsletter.status.textColor,
                                            backgroundColor: newsletter.status.backgroundColor,
                                        }}
                                    >
                                        <div className="w-3 aspect-square inline-block rounded-full mr-2" style={{ backgroundColor: newsletter.status.textColor }}></div>
                                        {newsletter.status.displayName}
                                    </span>
                                </td>
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