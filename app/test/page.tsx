// "use client";

// import { useEffect, useState } from "react";

// const Page = () => {
//   const [videos, setVideos] = useState([]);
//   const regionCode = "FR";
//   const maxResults = 10;

//   const date2024 = new Date(2024, 5, 26).toISOString();

//   //   fetch(url)
//   //     .then((response) => {
//   //       if (!response.ok) {
//   //         throw new Error("Network response was not ok " + response.statusText);
//   //       }
//   //       return response.json();
//   //     })
//   //     .then((data) => {
//   //       const videos = data.items;
//   //       videos.forEach((video) => {
//   //         console.log(video);
//   //       });
//   //       setVideos(videos);
//   //     })
//   //     .catch((error) => {
//   //       console.error(
//   //         "There has been a problem with your fetch operation:",
//   //         error
//   //       );
//   //     });
//   console.log(videos);
//   const fetchData = async (duration) => {
//     console.log(duration);
//     try {
//       const response = await fetch(
//         `https://www.googleapis.com/youtube/v3/search?part=snippet&relevanceLanguage=FR&order=viewCount&type=video&videoDuration=${duration}&maxResults=${maxResults}&publishedAfter=${date2024}&key=${apiKey}`
//       );
//       const data = await response.json();

//       const videoIds = data.items.map((item) => item.id.videoId);

//       const viewCounts = await Promise.all(
//         videoIds.map((id) => getVideoDetails(id))
//       );

//       const videoDetails = data.items.map((video, index) => ({
//         ...video,
//         viewCount: viewCounts[index],
//       }));

//       return videoDetails;
//     } catch (error) {
//       console.error(
//         "There has been a problem with your fetch operation:",
//         error
//       );
//     }
//   };

//   const getVideoDetails = async (videoId) => {
//     const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;
//     const response = await fetch(videoDetailsUrl);
//     const data = await response.json();
//     return data.items[0].statistics.viewCount;
//   };

//   useEffect(() => {
//     const fetchAllData = async () => {
//       const longVideos = await fetchData("long");
//       const mediumVideos = await fetchData("medium");
//       setVideos([...longVideos, ...mediumVideos]);
//       // setVideos([...longVideos]);
//     };
//     fetchAllData();
//   }, []);
//   return (
//     <div>
//       {videos
//         .sort((a, b) => b.viewCount - b.viewCount)
//         .map((video) => (
//           <div key={video.id.videoId} className="text-white">
//             <h3>{video.snippet.title}</h3>
//             <p>Views: {video.viewCount}</p>
//           </div>
//         ))}
//     </div>
//   );
// };

// export default Page;

const Page = () => {
  return <div>hello</div>;
};

export default Page;
