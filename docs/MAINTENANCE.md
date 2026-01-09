# Maintenance Guide

## Dependencies

### Update Strategy

**Regular Updates:**
- Check for updates monthly
- Review changelogs before updating
- Test thoroughly after updates

**Security Patches:**
- Apply immediately when available
- Use `npm audit` to check for vulnerabilities
- Run `npm audit fix` for automatic fixes

**Major Version Updates:**
- Review breaking changes
- Test all features thoroughly
- Update incrementally if possible

### Dependency Commands

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Testing

### Manual Testing Checklist

**Before Deployment:**
- [ ] Test forward calculation mode
- [ ] Test reverse calculation mode
- [ ] Test with various input values
- [ ] Test edge cases (zero values, very large numbers)
- [ ] Test responsive design on multiple devices
- [ ] Test in different browsers
- [ ] Verify calculations are correct

### Edge Cases to Test

**Input Validation:**
- Zero values
- Negative values (should be handled)
- Very large numbers
- Decimal values
- Empty fields

**Calculation Edge Cases:**
- Stop loss equals entry price
- Risk per share = 0
- Division by zero scenarios
- Very small risk percentages
- Very large account sizes

**UI Edge Cases:**
- Mobile screen sizes
- Tablet screen sizes
- Different browser zoom levels
- Dark mode vs light mode

## Code Quality

### Linting

```bash
npm run lint
```

**Rules:**
- ESLint configured for React and TypeScript
- Strict TypeScript checking enabled
- No unused variables or parameters

### Type Checking

```bash
npm run build
```

TypeScript compiler checks:
- Type errors
- Unused locals
- Unused parameters
- Fallthrough cases

## Version History

### Version 1.0.0 (Current)

**Features:**
- Forward calculation mode
- Reverse calculation mode
- Responsive UI with shadcn/ui components
- TypeScript support
- Vercel deployment configuration

**Release Date:** 2025-01-27

## Troubleshooting

### Build Issues

**TypeScript Errors:**
- Check `tsconfig.json` configuration
- Verify path aliases are correct
- Ensure all types are properly defined

**Build Failures:**
- Clear `node_modules` and reinstall
- Check Node.js version (18.x or higher)
- Verify all dependencies are installed

### Runtime Issues

**Calculations Not Updating:**
- Check React state management
- Verify input handlers are connected
- Check browser console for errors

**Styling Issues:**
- Verify Tailwind CSS is configured correctly
- Check `index.css` imports
- Verify PostCSS configuration

## Support

### Documentation
- README.md: Quick start guide
- SPECIFICATION.md: Complete specification index
- Individual docs in `docs/` directory

### Issues
- Check GitHub issues for known problems
- Create new issue with detailed description
- Include browser and OS information

---

**Last Updated:** 2025-01-27
