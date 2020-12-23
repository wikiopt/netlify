import React from "react";
import { graphql, Link, useStaticQuery } from "gatsby";

const Writer = ({ authorName }) => {
  const { authors } = useStaticQuery(graphql`
    query FindAuthor {
      authors: allMarkdownRemark(filter: { frontmatter: { templateKey: { eq: "author-page" } } }) {
        nodes {
          frontmatter {
            title
            description
            slug
            image {
              base
              childImageSharp {
                original {
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  `);
  const author = authors.nodes.filter((author) => author.frontmatter.title === authorName)[0];
  const { title, description, slug, image } = author.frontmatter;
  const { base: img } = image;
  const { width, height } = image.childImageSharp.original;

  return (
    <div className="author">
      <Link to={`/author/${slug}/`} className="author-img-link">
        <img src={`/img/${img}`} alt={title} loading="lazy" className="author-img" width={width} height={height} />
      </Link>
      <div className="author-text">
        <Link to={`/author/${slug}/`} className="author-title-link">
          {title}
        </Link>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Writer;
