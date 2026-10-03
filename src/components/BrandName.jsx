// The name, in English and Kannada, used in every header.
export default function BrandName({ size = "md", light = false }) {
  return (
    <span className={`brand-name ${size} ${light ? "light" : ""}`}>
      <b>Chili Pili Kannada Kali</b>
      <span className="kn">ಚಿಲಿಪಿಲಿ ಕನ್ನಡ ಕಲಿ</span>
    </span>
  );
}
