import '../styles/Button.css';

export default function Button({ onClick, children }) {
    return (
      <button className="custom-button" onClick={onClick}>
        {children}
      </button>
    );
  }
  