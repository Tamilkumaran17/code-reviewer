import '../styles/Button.css';

export default function Button({children, ...props }) {
    return (
      <button className="custom-button" {...props}>
        {children}
      </button>
    );
  }
  