import React, { useContext } from 'react';
import FeatureCard from './FeatureCard'; 
import { userContext } from '../../Context/userContext'; 

const FeatureGrid = (props) => {
    const { user } = useContext(userContext);

    const Name = user?.userName;

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 py-16 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold tracking-tight">
                        Insansa's HR Portal
                    </h2>
                    <p className="mt-4 text-lg md:text-xl text-gray-200">
                        Welcome {Name}
                    </p>
                    <p className="mt-4 text-lg md:text-xl text-gray-200">
                        Explore Inside Requirements and Manage Workforce Effectively
                    </p>
                </div>
            </div>

            <h1 className="mt-10 font-extrabold text-3xl">APPLICATIONS</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {props.appItems.map((item, i) =>
                    user.role === 'user' && (i === 1 || i === 2) ? null : (
                        <FeatureCard
                            key={i}
                            title={item.title}
                            description={item.description}
                            header={item.header}
                            icon={item.icon}
                            className={i === 1 || i === 2 ? 'md:col-span-2' : ''}
                            nav={item.nav}
                            img={item.img}
                        />
                    )
                )}
            </div>

            {user.role === 'user' ? null : (
                <>
                    <h1 className="mt-10 font-extrabold text-3xl">TALENT MANAGEMENT</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {props.talentItems.map((item, i) => (
                            <FeatureCard
                                key={i}
                                title={item.title}
                                description={item.description}
                                header={item.header}
                                icon={item.icon}
                                className={i === 3 || i === 6 ? 'md:col-span-2' : ''}
                                nav={item.nav}
                                img={item.img}
                            />
                        ))}
                    </div>

                    {user && user.role === 'superAdmin' ? (
                        <>
                            <h1 className="mt-10 font-extrabold text-3xl">AUTHENTICATION MANAGEMENT</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                {props.authenticationItems.map((item, i) => (
                                    <FeatureCard
                                        key={i}
                                        title={item.title}
                                        description={item.description}
                                        header={item.header}
                                        icon={item.icon}
                                        className={'md:col-span-3'}
                                        nav={item.nav}
                                        img={item.img}
                                    />
                                ))}
                            </div>
                        </>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default FeatureGrid;
