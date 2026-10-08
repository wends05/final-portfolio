import {
	HouseIcon,
	type Icon,
	LightbulbFilamentIcon,
	ListBulletsIcon,
} from "@phosphor-icons/react";

const routes: {
	path: string;
	Icon: Icon;
}[] = [
	{
		path: "/",
		Icon: HouseIcon,
	},
	{
		path: "/skills",
		Icon: LightbulbFilamentIcon,
	},
	{
		path: "/projects",
		Icon: ListBulletsIcon,
	},
];

export default function Navbar() {
	return (
		<nav className="page-grid fixed inset-x-0 top-0 z-10 py-6">
			<ul className="col-span-full flex flex-row items-end gap-5">
				{routes.map(({ path, Icon }) => (
					<li key={path}>
						<Icon size={40} />
					</li>
				))}
			</ul>
		</nav>
	);
}
