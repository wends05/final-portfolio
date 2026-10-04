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
		<nav className="w-full p-10">
			<ul className="items-end w-full flex flex-row gap-5">
				{routes.map(({ path, Icon }) => (
					<li key={path}>
						<Icon size={40} />
					</li>
				))}
			</ul>
		</nav>
	);
}
