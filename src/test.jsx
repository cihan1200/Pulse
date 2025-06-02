import "./test.css";
import axios from "axios";

import { useState, useEffect } from "react";

export default function Test() {
  const [medias, setMedias] = useState([]);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("http://localhost:3000/posts/680f44731cc4545b599343a3");
      console.log(response);
      setMedias(response.data.post.media);
    };

    fetchData(); // Call the async function
  }, []); // Add dependencies if needed

  console.log(medias);

  const nextButton = () => {
    setMediaIndex((prevIndex) => (prevIndex + 1) % medias.length);
  };

  const prevButton = () => {
    setMediaIndex((prevIndex) => (prevIndex - 1 + medias.length) % medias.length);
  };

  return (
    <>
      {medias.map((media, index) => {
        if (media.endsWith(".mp4")) {
          return (
            <video key={index} controls className="img">
              <source src={`http://${media}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          );
        }
        if (media.endsWith(".jpg") || media.endsWith(".jpeg") || media.endsWith(".png")) {
          return <img key={index} src={`http://${media}`} alt="media" className="img" />;
        }
      }
      )}
      <div className="divv">
        <button onClick={prevButton}>Previous</button>
        <div className="img-container">
          {medias[mediaIndex].endsWith(".mp4") ? (
            <video controls className="video">
              <source src={`http://${medias[mediaIndex]}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img className="img" src={`http://${medias[mediaIndex]}`} alt="" />
          )}
          <span>{mediaIndex + 1} / {medias.length}</span>
        </div>

        <button onClick={nextButton}>Next</button>
      </div>
    </>
  );
}