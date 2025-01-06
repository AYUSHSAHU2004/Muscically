import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#3d1689',
    color: 'white',
    paddingTop: '24px',
    paddingBottom: '24px',
    fontFamily: 'sans-serif',
  };

  const containerStyle = {
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: '24px',
    paddingRight: '24px',
  };

  const flexStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const spaceYStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const spaceXStyle = {
    display: 'flex',
    gap: '24px',
  };

  const headingStyle = {
    fontSize: '24px',
    fontWeight: '800',
    textAlign: 'center',
    paddingTop: '24px',
    paddingBottom: '24px',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
  };

  const contactStyle = {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '16px',
  };

  const addressStyle = {
    display: 'grid',
    gap: '8px',
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white',
  };

  const logoStyle = {
    height: '80px',
    width: '72px',
    filter: 'invert(100%) brightness(0)',
  };

  const bottomStyle = {
    marginTop: '24px',
    borderTop: '1px solid #2d2d2d',
    paddingTop: '16px',
    fontSize: '14px',
    textAlign: 'center',
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={flexStyle}>
          {/* Footer Navigation Links */}
          <div style={spaceYStyle}>
            <h1 style={headingStyle}>
              Made by Ayush Sahu ❤️
            </h1>

            <div>
              <h3 style={contactStyle}>Contact Me</h3>
              <address style={addressStyle}>
                <a
                  href="mailto:"
                  style={linkStyle}
                >
                  <img
                    alt="Vector"
                    src="/email.svg"
                    style={{ paddingRight: '16px' }}
                  />
                  <p>2023ugee091@nitjsr.ac.in</p>
                </a>
                <a href="tel:+91 96709 66612" style={linkStyle}>
                  <img
                    alt="Vector"
                    src="/phone.svg"
                    style={{ paddingRight: '16px' }}
                  />
                  +91 8093505126
                </a>
              </address>
            </div>
          </div>

          
        </div>

        {/* Bottom Section */}
        <div style={bottomStyle}>
          © {new Date().getFullYear()} Ayush Sahu. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
