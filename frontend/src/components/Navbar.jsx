import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="bg-blue-300">
      <ul className="flex justify-around items-center list-none py-6">
        <li className="font-bold text-4xl">splitKaro</li>
        <li>
          <NavLink to="/" className={({isActive})=> isActive ? 'font-bold underline decoration-2' : 'font-medium'}>Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/add-expense" className={({isActive})=> isActive ? 'font-bold underline decoration-2' : 'font-medium'}>Add Expense</NavLink>
        </li>
        <li>
          <NavLink to="/expenses" className={({isActive})=> isActive ? 'font-bold underline decoration-2' : 'font-medium'}>Expenses</NavLink>
        </li>
        <li>
            <NavLink to="/settle" className={({isActive})=> isActive ? 'font-bold underline decoration-2' : 'font-medium'}>Settle Up</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
