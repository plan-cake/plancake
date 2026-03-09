import plugin from "tailwindcss/plugin";

const config = {
    plugins: [
        // Custom utility for shrinking header transition for DRY
        plugin(function ({ matchUtilities }) {
            matchUtilities({
                "header-transition": (value) => ({
                    transitionProperty: value,
                    transitionDuration: "250ms",
                    transitionTimingFunction: "ease-out",
                }),
            });
        }),
    ]
}

export default config;
