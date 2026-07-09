import { NavLink } from 'react-router-dom';

const cls = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-brand">Interview Prep</div>
      <div className="nav-links">
        <NavLink to="/" className={cls} end>Home</NavLink>
        <NavLink to="/leetcode" className={cls}>LeetCode</NavLink>
        <NavLink to="/system-design" className={cls}>System Design</NavLink>
        <NavLink to="/behavioral" className={cls}>Behavioral</NavLink>
        <NavLink to="/settings" className={cls}>Settings</NavLink>
      </div>
    </nav>
  );
}
