import React from 'react';
import { Link } from "gatsby-theme-material-ui";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& a:hover': {
      textDecoration: 'none',
    }
  },
  nested: {
    paddingLeft: theme.spacing(2),
  },
}));

function NavListItem({ title, pathname }) {
  const selected = pathname === window.location.pathname;
  return (
    <Link to={pathname}>
      <ListItem button selected={selected}>
        <ListItemText primary={title}/>
      </ListItem>
    </Link>
  );          
}

function NestedNavListItem({ title, children, open = false }) {
  const [isOpen, setOpen] = React.useState(open);
  const handleClick = () => {
    setOpen(!isOpen);
  };
  return (
    <React.Fragment>
      <ListItem button onClick={handleClick}>
        <ListItemText primary={title}/>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </React.Fragment>
  );
}

// Ideally these annotations would be added in nav-tree.js, but for now it's
// probably OK because it's only run once at the root component.
function annotateCurrentPath(nav) {
  if (nav.page && window.location.pathname === nav.page.pathname) {
    return { ...nav, onCurrentPath: true };
  }
  const children = nav.children.map(annotateCurrentPath);
  let onCurrentPath = children.some(child => child.onCurrentPath);
  return {...nav, children, onCurrentPath };
}

export default function NestedNav({ nav, root = true, ...rest }) {
  const classes = useStyles();
  const { key, title, page, children, onCurrentPath = false } = nav;
  let listItems = null;

  if (root) {
    listItems = children.map(child => (
      <NestedNav nav={annotateCurrentPath(child)} root={false} key={child.key}/>
    ));
  } else if (children.length === 0 && page) {
    listItems = <NavListItem title={page.title} pathname={page.pathname} key={key}/>;
  } else if (children.length > 0) {
    const nested = (page ? [{ ...nav, children: [] }, ...children] : children)
      .map(child => (
        <NestedNav nav={child} root={false} key={child.key} className={classes.nested}/>
      ));
    listItems = (
      <NestedNavListItem title={title} open={onCurrentPath} key={key}>
        {nested}
      </NestedNavListItem>
    );
  }
  return (
    <List component='nav' className={classes.root} { ...rest }>
      {listItems}
    </List>
  );
}
