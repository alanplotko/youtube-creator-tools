import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation(props) {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center mt-32">
            <div className="flex flex-col">
                <nav className="flex justify-around py-4 bg-white/80 backdrop-blur-md shadow-md w-full fixed top-0 left-0 right-0 z-10">
                    <div className="flex items-center">
                        <Link href="/" passHref>
                            <a className="cursor-pointer">
                                <h3 className="text-2xl font-medium text-gray-600 cursor-pointer">
                                    <div className="flex items-center">
                                        <i className='bi bi-youtube text-4xl text-red-600 mr-2'></i>
                                        <span>YouTube Creator Tools</span>
                                    </div>
                                </h3>
                            </a>
                        </Link>
                    </div>

                    <div className="items-center hidden space-x-8 lg:flex">
                        <Link href="/" passHref>
                            <a className={`${router.pathname == "/" ? "font-semibold" : ""} flex text-gray-600 hover:text-blue-500 text-xl cursor-pointer transition-colors duration-300`}>
                                Home
                            </a>
                        </Link>

                        <Link href="/projects" passHref>
                            <a className={`${router.pathname == "/projects" ? "font-semibold" : ""} flex text-gray-600 hover:text-blue-500 text-xl cursor-pointer transition-colors duration-300`}>
                                Projects
                            </a>
                        </Link>
                    </div>

                    {props.user && (
                        <Link href="/" passHref>
                            <a className="cursor-pointer">
                                <div className="flex items-center space-x-5">
                                    <Image className="rounded-md" src={props.user.image} width={36} height={36} alt="Avatar" />
                                    <span className="text-xl">{props.user.name}</span>
                                </div>
                            </a>
                        </Link>
                    )}

                    {!props.user && (
                        <Link href="/" passHref>
                            <a className="cursor-pointer">
                                <div className="flex items-center space-x-2">
                                    <i className='bi bi-person-badge-fill text-4xl text-gray-600'></i>
                                    <span className="text-xl">Login</span>
                                </div>
                            </a>
                        </Link>
                    )}
                </nav>
            </div>
        </div>
    );
}
