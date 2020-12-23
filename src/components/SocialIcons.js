import React from "react";
import Facebook from "../svg-icons/facebook.js";
import Youtube from "../svg-icons/youtube.js";
import Twitter from "../svg-icons/twitter.js";
import useSiteMetaData from "./SiteMetadata";

const SocialIcons = () => {
  const {
    social: { facebook, youtube, twitter },
  } = useSiteMetaData();

  return (
    <div className="social-icons">
      <a href={youtube} className="social-icon" target="_blank" data-wpel-link="external" rel="follow external noopener noreferrer">
        <Youtube />
      </a>
      <a href={facebook} className="social-icon" target="_blank" data-wpel-link="external" rel="follow external noopener noreferrer">
        <Facebook />
      </a>
      <a href={twitter} className="social-icon" target="_blank" data-wpel-link="external" rel="follow external noopener noreferrer">
        <Twitter />
      </a>
    </div>
  );
};

export default SocialIcons;
