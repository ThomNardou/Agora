"use client";

import { Input, Button, Alert } from "@mui/joy";
import { LuPen } from "react-icons/lu";
import { HiOutlineFolderAdd } from "react-icons/hi";
import { useState, useRef } from "react";
import NewsLetterForm from "@/app/components/newsLetterForm";

export default function CreateNewsletterPage() {

    return (
        <>
            <NewsLetterForm mode="create" title="Créer une campagne" />


        </>
    )
}