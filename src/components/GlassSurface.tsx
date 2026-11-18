import { BlurView, BlurTargetView } from 'expo-blur';
import {
  createContext,
  useContext,
  useRef,
  type ComponentRef,
  type PropsWithChildren,
  type RefObject,
} from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from '../styles/glass.styles';

const BlurTargetContext = createContext<
  RefObject<ComponentRef<typeof View> | null> | null
>(null);

export function GlassCanvas({ children }: PropsWithChildren) {
  const blurTarget = useRef<ComponentRef<typeof View>>(null);

  return (
    <View style={styles.canvas}>
      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
        <View style={styles.backdrop} />
        <View style={[styles.glow, styles.topGlow]} />
        <View style={[styles.glow, styles.bottomGlow]} />
      </BlurTargetView>
      <BlurTargetContext.Provider value={blurTarget}>
        {children}
      </BlurTargetContext.Provider>
    </View>
  );
}

export function GlassSurface({
  children,
  style,
  intensity = 38,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}>) {
  const blurTarget = useContext(BlurTargetContext);

  return (
    <View style={[styles.surface, style]}>
      <BlurView
        blurMethod="dimezisBlurViewSdk31Plus"
        blurTarget={blurTarget ?? undefined}
        intensity={intensity}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        tint="dark"
      />
      {children}
      <View pointerEvents="none" style={styles.highlight} />
    </View>
  );
}
