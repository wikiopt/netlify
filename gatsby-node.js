const _ = require("lodash");
const path = require("path");
const { fmImagesToRelative } = require("gatsby-remark-relative-images");
const sharp = require(`sharp`);

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  return graphql(`
    {
      pages: allMarkdownRemark(filter: { frontmatter: { templateKey: { eq: "default-page" } } }) {
        nodes {
          id
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
      categories: allMarkdownRemark(filter: { frontmatter: { templateKey: { eq: "category-page" } } }) {
        nodes {
          id
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
      categoriesCount: allMdx {
        group(field: frontmatter___category) {
          category: fieldValue
          totalCount
        }
      }
      authors: allMarkdownRemark(filter: { frontmatter: { templateKey: { eq: "author-page" } } }) {
        nodes {
          id
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
      authorsCount: allMdx {
        group(field: frontmatter___author) {
          author: fieldValue
          totalCount
        }
      }
      posts: allMdx {
        nodes {
          id
          rawBody
          body
          fields {
            slug
          }
          frontmatter {
            templateKey
            title
            category
            beforebody
            afterbody
            featuredimage {
              base
              name
            }
            sidebar {
              image {
                base
                name
              }
            }
            products {
              name
              image {
                base
                name
              }
            }
          }
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      result.errors.forEach((e) => console.error(e.toString()));
      return Promise.reject(result.errors);
    }

    const posts = result.data.posts.nodes;
    const pages = result.data.pages.nodes;
    const categories = result.data.categories.nodes;
    const categoriesCount = result.data.categoriesCount.group;
    const authors = result.data.authors.nodes;
    const authorsCount = result.data.authorsCount.group;

    const createImages = async (match, type, options, mobile = false) => {
      const stream = sharp(match);
      const name = match.split("/").filter(Boolean).pop();
      const lastDot = name.lastIndexOf(".");
      const fileName = name.substring(0, lastDot);
      const path = "./static/image";
      const newPath = mobile ? `${path}/${type}/${fileName}-m.webp` : `${path}/${type}/${fileName}.webp`;
      await stream.resize(options).webp({ quality: 100 }).toFile(newPath);
    };

    const createCategories = () => {
      categories.forEach((category) => {
        const id = category.id;
        const title = category.frontmatter.title;
        const slug = category.fields.slug;
        const categoryCount = categoriesCount.filter((categoryCount) => categoryCount.category === title)[0];
        const totalPosts = categoryCount && categoryCount.totalCount;
        const postsPerPage = 6;
        const numPages = totalPosts ? Math.ceil(totalPosts / postsPerPage) : 1;

        Array.from({ length: numPages }).forEach((_, i) => {
          createPage({
            path: i === 0 ? `${slug}/` : `${slug}/${i + 1}/`,
            component: path.resolve(`./src/templates/category-page.js`),
            context: {
              id,
              slug: slug,
              category: title,
              limit: postsPerPage,
              skip: i * postsPerPage,
              numPages,
              currentPage: i + 1,
            },
          });
        });
      });
    };

    createCategories();

    const createPages = () => {
      pages.forEach((page) => {
        const id = page.id;
        const slug = page.fields.slug;

        createPage({
          path: slug == "/index" ? "/" : `${slug}/`,
          component: path.resolve(`src/templates/default-page.js`),
          // additional data can be passed via context
          context: {
            id,
          },
        });
      });
    };

    createPages();

    const createAuthors = () => {
      authors.forEach((author) => {
        const id = author.id;
        const title = author.frontmatter.title;
        const slug = `/author${author.fields.slug}`;
        const authorCount = authorsCount.filter((authorCount) => authorCount.author === title)[0];
        const totalPosts = authorCount && authorCount.totalCount;
        const postsPerPage = 6;
        const numPages = totalPosts ? Math.ceil(totalPosts / postsPerPage) : 1;

        Array.from({ length: numPages }).forEach((_, i) => {
          createPage({
            path: i === 0 ? `${slug}/` : `${slug}/${i + 1}/`,
            component: path.resolve(`./src/templates/author-page.js`),
            context: {
              id,
              slug: slug,
              category: title,
              limit: postsPerPage,
              skip: i * postsPerPage,
              numPages,
              currentPage: i + 1,
            },
          });
        });
      });
    };

    createAuthors();

    const createPosts = () => {
      posts.forEach((post) => {
        const id = post.id;
        const slug = post.fields.slug;
        const tempKey = post.frontmatter.templateKey;

        const match = `./static/img/${post.frontmatter.featuredimage.base}`;
        createImages(match, "category", { width: 348 });
        createImages(match, "front-first", { width: 675 });
        createImages(match, "front-right", { width: 195 });
        createImages(match, "latest", { width: 385 });
        createImages(match, "post-first", { width: 868 });
        createImages(match, "post-first", { width: 450 }, true);
        createImages(match, "post-latest", { width: 230 });

        const sidebar = post.frontmatter.sidebar;
        if (sidebar !== null && sidebar.image !== null) {
          const match = `./static/img/${sidebar.image.base}`;
          createImages(match, "sidebar", { width: 230, height: 150, fit: "inside" });
        }

        const products = post.frontmatter.products;
        if (products !== null) {
          products.map((item) => {
            if (item.image !== null) {
              const match = `./static/img/${item.image.base}`;
              const stream = sharp(match);
              const info = stream.metadata();
              if (info.width < 800) {
                createImages(match, "post", { width: info.width, fit: "inside" });
              } else {
                createImages(match, "post", { width: 800, fit: "inside" });
              }
              createImages(match, "table", { width: 110 });
              createImages(match, "table", { width: 220 }, true);
            }
          });
        }

        let m;
        let str = post.rawBody;
        str = str.split("\\").join("");
        str1 = post.frontmatter.beforebody + post.body;
        str2 = post.frontmatter.afterbody;

        const tocData = [];
        const tocRex1 = /(mdx\(PTitle, ({[^}]*}))/g;
        const tocRex2 = /(title: "([^"]*)")/g;
        const tocRex3 = /(hlevel: "([^"]*)")/g;
        while ((m = tocRex1.exec(str1))) {
          let title;
          let heading;
          const newStr = m[2].split("\n").join("").split('"').join('"').split("  ").join("");
          while ((me = tocRex2.exec(newStr))) {
            title = me[2];
          }
          while ((me = tocRex3.exec(newStr))) {
            heading = me[2];
          }
          tocData.push({
            title,
            heading: heading || "2",
            id:
              title &&
              title
                .replace(/[^\w ]/, "")
                .split(" ")
                .join("_"),
          });
        }

        if (products !== null) {
          products.forEach((item) => {
            tocData.push({
              title: item.name,
              heading: "3",
              id: item.name
                .replace(/[^\w ]/, "")
                .split(" ")
                .join("_"),
            });
          });
        }

        while ((m = tocRex1.exec(str2))) {
          let title;
          let heading;
          const newStr = m[2].split("\n").join("").split('"').join('"').split("  ").join("");
          while ((me = tocRex2.exec(newStr))) {
            title = me[2];
          }
          while ((me = tocRex3.exec(newStr))) {
            heading = me[2];
          }
          tocData.push({
            title,
            heading: heading || "2",
            id:
              title &&
              title
                .replace(/[^\w ]/, "")
                .split(" ")
                .join("_"),
          });
        }

        createPage({
          path: slug == "/index" ? "/" : `${slug}/`,
          component: path.resolve(`src/templates/${tempKey}.js`),
          // additional data can be passed via context
          context: {
            id,
            toc: tocData,
          },
        });
      });
    };

    createPosts(posts);
  });
};

exports.onCreateNode = ({ node }) => {
  fmImagesToRelative(node);
};

exports.createSchemaCustomization = ({ actions: { createTypes } }) => {
  createTypes(`
  type Mdx implements Node {
    frontmatter: MdxFrontmatter
  }

  type MdxFrontmatter {
    beforebody: String @mdx
    afterbody: String @mdx
    products: [MdxBody]
    sidebar: Sidebar
    faq: [Faq]
    productstabletitle: String
  }

  type MdxBody {
    name: String
    body: String @mdx
    image: File
    link: String
    pros: [String]
    cons: [String]
    specs: [Spec]
  }

  type Sidebar {
    stoc: [SidebarToC]
    stitle: String
    image: File
    alink: String
    atext: String
  }

  type SidebarToC {
    level: Boolean
    name: String
  }
  
  type Spec {
    name: String
    value: String
  }

  type Faq {
    ques: String
    ans: String
  }
`);
};
