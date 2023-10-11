import { Typography } from '@mui/material';
import { TreeItem, useTreeItem } from '@mui/x-tree-view/TreeItem';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';

const CustomContent = React.forwardRef(function CustomContent(props, ref) {
  const {
    classes,
    className,
    label,
    nodeId,
    icon: iconProp,
    expansionIcon,
    displayIcon,
  } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (event) => {
    preventSelection(event);
  };

  const handleExpansionClick = (event) => {
    handleExpansion(event);
  };

  const handleSelectionClick = (event) => {
    handleSelection(event);
  };

  return (
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref}
    >
      <div onClick={handleExpansionClick} className={classes.iconContainer}>
        {icon}
      </div>
      <Typography
        onClick={handleSelectionClick}
        component="div"
        className={classes.label}
      >
        {label}
      </Typography>
    </div>
  );
});

CustomContent.propTypes = {
  classes: PropTypes.object,
  className: PropTypes.string,
  label: PropTypes.node,
  nodeId: PropTypes.string.isRequired,
  icon: PropTypes.node,
  expansionIcon: PropTypes.node,
  displayIcon: PropTypes.node,
};

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  return <TreeItem ContentComponent={CustomContent} {...props} ref={ref} />;
});

export default CustomTreeItem;
