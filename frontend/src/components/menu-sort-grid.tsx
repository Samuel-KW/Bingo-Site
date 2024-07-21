import React from 'react';
import styles from "./menu-sort-grid.module.css";

const noop = () => {};

export interface MenuSortGridProps {
	checked?: boolean;
	onClick?: () => void;
};

class MenuSortGrid extends React.Component<MenuSortGridProps> {
	constructor(props: MenuSortGridProps){
    super(props);

    this.state = {
      checked: props.checked ?? false,
			onClick: props.onClick ?? noop,
    };
  }

  render() {
		const { checked, onClick } = this.props;
    return <>
			<button onClick={onClick} className={styles.sortGrid} data-checked={checked || undefined}>
				<span></span><span></span><span></span><span></span>
			</button>
		</>;
  }
}

export default MenuSortGrid;