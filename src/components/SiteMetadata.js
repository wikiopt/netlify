import { graphql, useStaticQuery } from "gatsby";

const useSiteMetaData = () => {
  const { site } = useStaticQuery(
    graphql`
      query SITE_METADATA_QUERY {
        site {
          siteMetadata {
            name
            title
            description
            social {
              facebook
              youtube
              twitter
              instagram
            }
            number
            siteURL
          }
        }
      }
    `
  );
  return site.siteMetadata;
};

export default useSiteMetaData;
