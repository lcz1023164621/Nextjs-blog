import { HomeContentCard } from "./home-content-card"

export const HomeContent = () => {
    return(
        <>
            <HomeContentCard 
                title="1024 程序员节「分红」现场：第一批鸿蒙开发者激励，有人真的领到钱或福利了吗?"
                content="很多开发者已经在网上晒出了激励金，收到这样那样的作品，就表示开发者通过鸿蒙开发者激励计划获得了真金白银的奖励。根据HarmonyOS开发者官网的信息，这个激励计划的非常慷慨优厚，面向所有... "
                thumbnail="/panda.jpg"
                author={{
                name: "Morgan"
                }}
                stats={{
                agrees: 167,
                comments: 9,
                isAgreed: true,
                isFavorited: false,
                isLiked: false
            }}
            />

            <HomeContentCard 
                title="1024 程序员节「分红」现场：第一批鸿蒙开发者激励，有人真的领到钱或福利了吗?"
                content="很多开发者已经在网上晒出了激励金，收到这样那样的作品，就表示开发者通过鸿蒙开发者激励计划获得了真金白银的奖励。根据HarmonyOS开发者官网的信息，这个激励计划的非常慷慨优厚，面向所有... "
                thumbnail="/panda.jpg"
                author={{
                name: "Morgan"
                }}
                stats={{
                agrees: 167,
                comments: 9,
                isAgreed: true,
                isFavorited: false,
                isLiked: false
            }}
            />
        </>
    )
}