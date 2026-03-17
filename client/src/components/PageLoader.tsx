import { motion } from "framer-motion";

const PageLoader = () => {
    return (
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] -mr-48 -mt-24 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-50 rounded-full blur-[130px] -ml-64 -mb-32 opacity-60"></div>

            <div className="relative">
                {/* Outer Spinning Ring */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-t-4 border-r-4 border-emerald-600 rounded-full"
                ></motion.div>

                {/* Inner Pulse Circle */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"
                >
                    <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-6 h-6 text-white"
                    >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
            >
                <h2 className="text-2xl font-black tracking-tighter text-slate-900">
                    Sehat<span className="text-emerald-600">kor</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Excellence</span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PageLoader;
