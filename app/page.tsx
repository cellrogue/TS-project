import PublicLayout from './(root)/layout';
import LandingPage from './(root)/page';

const IndexPage = () => {
    return (
        <PublicLayout>
            {/* Main root content, outside of the landing page */}
            <LandingPage />
        </PublicLayout>
    );
};

export default IndexPage;
