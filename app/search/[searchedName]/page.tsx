"use client";
import { axiosInterceptorInstance } from "@/interceptor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const [searchedMangas, setSearchedMangas] = useState([]);

  const searchedName = useParams();

  console.log(searchedName);

  const fetchSearchedMangas = async () => {
    try {
      const response = await axiosInterceptorInstance.post(
        "/manga",
        searchedName
      );
      setSearchedMangas(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSearchedMangas();
  }, []);

  console.log(searchedMangas);

  return <div>hello</div>;
};
export default Page;
