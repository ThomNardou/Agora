import { BsEnvelope } from "react-icons/bs";

export default function Logo({size = 32}: {size?: number}) {
    return (
        <div 
            className="bg-blue-700 flex items-center justify-center rounded-md"
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            <BsEnvelope 
                className="text-white"
                style={{ width: `${size / 2}px`, height: `${size / 2}px` }}
            />
        </div>
    )
}