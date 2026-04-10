import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="bg-blue-300">
      <ul className="flex justify-around items-center list-none py-6">
        <li className="font-bold text-4xl">splitKaro</li>
        <li className="font-semibold">
          <Link to="/">Dashboard</Link>
        </li>
        <li className="font-semibold">
          <Link to="/add-expense">Add Expense</Link>
        </li>
        <li className="font-semibold">
          <Link to="/expenses">Expenses</Link>
        </li>
        <li className="font-semibold">
            <Link to="/settle">Settle Up</Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
