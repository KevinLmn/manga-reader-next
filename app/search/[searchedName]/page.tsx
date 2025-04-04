'use client';
import MangaSection, { SectionType } from '@/app/(features)/manga/components/MangaSection';
import { axiosInterceptorInstance } from '@/lib/interceptor';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const Page = () => {
  const [searchedMangas, setSearchedMangas] = useState([]);

  const searchedName = useParams();

  console.log(searchedName);

  const fetchSearchedMangas = async () => {
    try {
      const response = await axiosInterceptorInstance.post('/manga', searchedName);
      setSearchedMangas(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSearchedMangas();
  }, []);

  return (
    <div>
      <div className="flex justify-center font-bold uppercase text-3xl pt-8 text-white">
        {searchedName.searchedName}
      </div>
      <MangaSection mangas={searchedMangas} sectionType={SectionType.Popular} />
    </div>
  );
};
export default Page;
