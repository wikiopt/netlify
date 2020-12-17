import React from "react";
import Layout from "../../components/Layout";
import HeadData from "../../components/HeadData.js";
import useSiteMetaData from "../../components/SiteMetadata.js";

export default () => {
  const { name } = useSiteMetaData();

  return (
    <Layout title="Thanks" link="/contact-us/" titleParent="Contact Us">
      <section className="section default-page">
        <HeadData title={`Thanks - ${name}`} description="Thanks for contacting us." index={false} />
        <div className="container">
          <div className="content">
            <h1>Thank you!</h1>
            <p>Thank you page for form submission.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};
