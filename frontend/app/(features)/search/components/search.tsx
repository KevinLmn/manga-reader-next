'use client';

import { Input } from '@/app/components/ui/input';
import { axiosInterceptorInstance } from '@/lib/interceptor';
import { FormEvent, useState } from 'react';

export function Search() {
  const [search, setSearch] = useState('');

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    console.log('hello');
    e.preventDefault();
    try {
      const response = await axiosInterceptorInstance.post(
        '/manga',
        {
          mangaName: search,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex justify-center mb-8 md:mb-12">
        <Input
          className="w-full max-w-md px-4 py-3 rounded-md border border-gray-200 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:border-gray-800"
          placeholder="Search for manga titles..."
          type="text"
          onChange={handleSearchChange}
        />
        <button onClick={handleSubmit}> Validate</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8" />
    </div>
  );
}
