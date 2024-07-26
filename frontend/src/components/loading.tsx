import { SimpleGrid, Skeleton } from "@mantine/core";


export const loadingBingoBoard = <SimpleGrid p={30} cols={3}>
	{ Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} radius="xl" p={20} style={{ "aspectRatio": "1 / 1", "width": "100%" }} />) }
</SimpleGrid>