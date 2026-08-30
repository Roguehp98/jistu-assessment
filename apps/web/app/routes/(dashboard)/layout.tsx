import Header from "./header";

const StandaloneLayout = () => {
	return (
		<div className="min-h-screen">
			<Header />

			<Outlet />
		</div>
	);
};

export default StandaloneLayout;
