export const calculateTextLength = (children: any): number => {
  if (typeof children === 'string') {
    return children.length;
  }

  if (Array.isArray(children)) {
    return children.reduce((total, child) => total + calculateTextLength(child), 0);
  }

  if (children && typeof children === 'object' && children.props?.children) {
    return calculateTextLength(children.props.children);
  }

  return 0;
};
